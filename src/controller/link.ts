import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Link } from "../entity/Link";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

function isValidURL(url: string): boolean {
  try {
    const u = new URL(url);
    return !!u.protocol && !!u.hostname;
  } catch {
    return false;
  }
}

function buildShortUrl(code: string): string {
  const base = process.env.BASE_URL?.replace(/\/+$/, "");
  return `${base}/${code}`;
}

function generateRandomCode(length = 6): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

async function generateUniqueCode(repo: ReturnType<typeof linkRepo>): Promise<string> {
  while (true) {
    const code = generateRandomCode(6);
    const exists = await repo.findOne({ where: { code } });
    if (!exists) return code;
  }
}

const linkRepo = () => AppDataSource.getRepository(Link);



export async function createLink(req: Request, res: Response) {
  try {
    const { originalUrl, customCode } = req.body || {};

    if (!originalUrl || typeof originalUrl !== "string" || !isValidURL(originalUrl)) {
      return res.status(400).json({ error: "Invalid originalUrl" });
    }

    const repo = linkRepo();

    if (customCode) {
      if (typeof customCode !== "string" || !CODE_REGEX.test(customCode)) {
        return res.status(400).json({
          error: "Invalid customCode. Use 6–8 alphanumeric characters.",
        });
      }
      const exists = await repo.findOne({ where: { code: customCode } });
      if (exists) return res.status(409).json({ error: "Code already exists" });

      const saved = await repo.save(
        repo.create({
          code: customCode,
          originalUrl,
          clicks: 0,
          lastClicked: null,
        })
      );

      return res.status(201).json({
        code: saved.code,
        originalUrl: saved.originalUrl,
        shortUrl: buildShortUrl(saved.code),
      });
    }

    const uniqueCode = await generateUniqueCode(repo);
    const saved = await repo.save(
      repo.create({
        code: uniqueCode,
        originalUrl,
        clicks: 0,
        lastClicked: null,
      })
    );

    return res.status(201).json({
      code: saved.code,
      originalUrl: saved.originalUrl,
      shortUrl: buildShortUrl(saved.code),
    });
  } catch (err) {
    console.error("[createLink] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


export async function listLinks(_req: Request, res: Response) {
  try {
    const repo = linkRepo();
    const links = await repo.find({ order: { createdAt: "DESC" } });
    const shaped = links.map((l) => ({
      code: l.code,
      originalUrl: l.originalUrl,
      clicks: l.clicks,
      lastClicked: l.lastClicked,
      createdAt: l.createdAt,
      shortUrl: buildShortUrl(l.code),
    }));
    return res.json(shaped);
  } catch (err) {
    console.error("[listLinks] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


export async function getLinkStats(req: Request, res: Response) {
  try {
    const { code } = req.params;
    const repo = linkRepo();
    const link = await repo.findOne({ where: { code } });
    if (!link) return res.status(404).json({ error: "Not found" });
    return res.json({
      code: link.code,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      lastClicked: link.lastClicked,
      createdAt: link.createdAt,
      shortUrl: buildShortUrl(link.code),
    });
  } catch (err) {
    console.error("[getLinkStats] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


export async function deleteLink(req: Request, res: Response) {
  try {
    const { code } = req.params;
    const repo = linkRepo();
    const link = await repo.findOne({ where: { code } });
    if (!link) return res.status(404).json({ error: "Not found" });

    await repo.remove(link);
    return res.status(204).send();
  } catch (err) {
    console.error("[deleteLink] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


export async function redirectByCode(req: Request, res: Response) {
  try {
    const { code } = req.params;
    const repo = linkRepo();
    const link = await repo.findOne({ where: { code } });

    if (!link) return res.status(404).send("Not found");

    link.clicks = (link.clicks ?? 0) + 1;
    link.lastClicked = new Date();
    await repo.save(link);

    const io = req.app.get('io');
    io.emit('link-clicked', {
      code: link.code,
      clicks: link.clicks,
      lastClicked: link.lastClicked
    });

    return res.redirect(307, link.originalUrl);
  } catch (err) {
    console.error("[redirectByCode] error:", err);
    return res.status(500).send("Internal server error");
  }
}